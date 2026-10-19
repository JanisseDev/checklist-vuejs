import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'checklist'
const MAX_HISTORY = 50
const DEFAULT_LIST_NAME = 'My list'

const newId = () =>
    globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)

const normalize = (name) => name.trim().toLocaleLowerCase()

const createList = (name, items = []) => ({ uuid: newId(), name, items })

// Older versions stored a single list as { _checklist: [...] }: wrap it into the first list
function migrateLegacyStorage() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
        if (!data || data._lists || !Array.isArray(data._checklist)) return
        const list = createList(DEFAULT_LIST_NAME, data._checklist)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ _lists: [list], _currentListId: list.uuid }))
    } catch {
        // Unreadable storage: keep the default state
    }
}

export const useChecklistStore = defineStore(STORAGE_KEY, () => {
    const initialList = createList(DEFAULT_LIST_NAME)
    const _lists = ref([initialList])
    const _currentListId = ref(initialList.uuid)
    // Changes recorded as diffs (only what changed), one history per list, replayed in reverse by undo (not persisted):
    //   { type: 'add', uuid }
    //   { type: 'delete', item, index }
    //   { type: 'check', uuids, checked }  -> previous checked state of these items
    const _histories = ref({})

    const currentList = computed(() => _lists.value.find((list) => list.uuid === _currentListId.value) ?? _lists.value[0])
    const items = computed(() => currentList.value.items)
    const history = computed(() => _histories.value[currentList.value.uuid] ?? [])

    // Unchecked first, then alphabetical. Copies the array so the stored order is untouched.
    const orderedChecklist = computed(() => {
        return [...items.value].sort((a, b) =>
            a.checked - b.checked || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        )
    })

    const checkedCount = computed(() => items.value.filter((item) => item.checked).length)
    const canUndo = computed(() => history.value.length > 0)

    const pushHistory = (change) => {
        const listHistory = (_histories.value[currentList.value.uuid] ??= [])
        listHistory.push(change)
        if (listHistory.length > MAX_HISTORY) {
            listHistory.shift()
        }
    }

    // Lists

    const selectList = (list) => {
        _currentListId.value = list.uuid
    }

    const addList = (listName) => {
        const name = listName.trim()
        if (!name) return null
        const list = createList(name)
        _lists.value.push(list)
        selectList(list)
        return list
    }

    const renameList = (list, listName) => {
        const name = listName.trim()
        if (name) list.name = name
    }

    // The last remaining list cannot be deleted
    const deleteList = (list) => {
        if (_lists.value.length <= 1) return
        const index = _lists.value.findIndex((l) => l.uuid === list.uuid)
        if (index === -1) return
        _lists.value.splice(index, 1)
        delete _histories.value[list.uuid]
        if (_currentListId.value === list.uuid) {
            _currentListId.value = _lists.value[Math.max(0, index - 1)].uuid
        }
    }

    // Items of the current list

    const findByName = (itemName) => items.value.find((item) => normalize(item.name) === normalize(itemName))

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
        items.value.push(item)
        pushHistory({ type: 'add', uuid: item.uuid })
        return item
    }

    const deleteChecklistItem = (item) => {
        const index = items.value.findIndex((i) => i.uuid === item.uuid)
        if (index === -1) return
        const [removed] = items.value.splice(index, 1)
        pushHistory({ type: 'delete', item: { ...removed }, index })
    }

    const toggleChecklistItem = (item) => {
        pushHistory({ type: 'check', uuids: [item.uuid], checked: item.checked })
        item.checked = !item.checked
    }

    const uncheckAll = () => {
        const checkedItems = items.value.filter((item) => item.checked)
        if (checkedItems.length === 0) return
        pushHistory({ type: 'check', uuids: checkedItems.map((item) => item.uuid), checked: true })
        checkedItems.forEach((item) => { item.checked = false })
    }

    const undoChecklistItem = () => {
        const change = history.value.pop()
        if (change === undefined) return

        switch (change.type) {
            case 'add': {
                const index = items.value.findIndex((item) => item.uuid === change.uuid)
                if (index !== -1) items.value.splice(index, 1)
                break
            }
            case 'delete': {
                const index = Math.min(change.index, items.value.length)
                items.value.splice(index, 0, change.item)
                break
            }
            case 'check': {
                const uuids = new Set(change.uuids)
                items.value.forEach((item) => {
                    if (uuids.has(item.uuid)) item.checked = change.checked
                })
                break
            }
        }
    }

    return {
        _lists,
        _currentListId,
        _histories,
        currentList,
        items,
        orderedChecklist,
        checkedCount,
        canUndo,
        selectList,
        addList,
        renameList,
        deleteList,
        addChecklistItem,
        deleteChecklistItem,
        toggleChecklistItem,
        uncheckAll,
        undoChecklistItem,
    }
},
{
    persist: {
        pick: ['_lists', '_currentListId'],
        beforeHydrate: migrateLegacyStorage,
    },
})
