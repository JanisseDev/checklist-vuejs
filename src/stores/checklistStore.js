import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const MAX_HISTORY = 50

const newId = () =>
    globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)

const normalize = (name) => name.trim().toLocaleLowerCase()

export const useChecklistStore = defineStore('checklist', () => {
    const _checklist = ref([])
    // Changes recorded as diffs (only what changed), replayed in reverse by undo (not persisted):
    //   { type: 'add', uuid }
    //   { type: 'delete', item, index }
    //   { type: 'check', uuids, checked }  -> previous checked state of these items
    const _history = ref([])

    // Unchecked first, then alphabetical. Copies the array so the stored order is untouched.
    const orderedChecklist = computed(() => {
        return [..._checklist.value].sort((a, b) =>
            a.checked - b.checked || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        )
    })

    const checkedCount = computed(() => _checklist.value.filter((item) => item.checked).length)
    const canUndo = computed(() => _history.value.length > 0)

    const pushHistory = (change) => {
        _history.value.push(change)
        if (_history.value.length > MAX_HISTORY) {
            _history.value.shift()
        }
    }

    const findByName = (itemName) => _checklist.value.find((item) => normalize(item.name) === normalize(itemName))

    // Returns the item that was added, or the existing item with the same name (unchecked if needed)
    const addChecklistItem = (itemName) => {
        const name = itemName.trim()
        if (!name) return null

        const existing = findByName(name)
        if (existing) {
            if (existing.checked) {
                pushHistory({ type: 'check', uuids: [existing.uuid], checked: true })
                existing.checked = false
            }
            return existing
        }

        const item = { uuid: newId(), name, checked: false }
        _checklist.value.push(item)
        pushHistory({ type: 'add', uuid: item.uuid })
        return item
    }

    const deleteChecklistItem = (item) => {
        const index = _checklist.value.findIndex((i) => i.uuid === item.uuid)
        if (index === -1) return
        const [removed] = _checklist.value.splice(index, 1)
        pushHistory({ type: 'delete', item: { ...removed }, index })
    }

    const toggleChecklistItem = (item) => {
        pushHistory({ type: 'check', uuids: [item.uuid], checked: item.checked })
        item.checked = !item.checked
    }

    const uncheckAll = () => {
        const checkedItems = _checklist.value.filter((item) => item.checked)
        if (checkedItems.length === 0) return
        pushHistory({ type: 'check', uuids: checkedItems.map((item) => item.uuid), checked: true })
        checkedItems.forEach((item) => { item.checked = false })
    }

    const undoChecklistItem = () => {
        const change = _history.value.pop()
        if (change === undefined) return

        switch (change.type) {
            case 'add': {
                const index = _checklist.value.findIndex((item) => item.uuid === change.uuid)
                if (index !== -1) _checklist.value.splice(index, 1)
                break
            }
            case 'delete': {
                const index = Math.min(change.index, _checklist.value.length)
                _checklist.value.splice(index, 0, change.item)
                break
            }
            case 'check': {
                const uuids = new Set(change.uuids)
                _checklist.value.forEach((item) => {
                    if (uuids.has(item.uuid)) item.checked = change.checked
                })
                break
            }
        }
    }

    return {
        _checklist,
        _history,
        orderedChecklist,
        checkedCount,
        canUndo,
        addChecklistItem,
        deleteChecklistItem,
        toggleChecklistItem,
        uncheckAll,
        undoChecklistItem,
    }
},
{
    persist: {
        pick: ['_checklist'],
    },
})
