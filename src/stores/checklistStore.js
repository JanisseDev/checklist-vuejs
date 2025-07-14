import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { uuid } from 'vue-uuid'

export const useChecklistStore = defineStore('checklist', () => {
    const _checklist = ref([])
    const _history = ref([])

    const orderedChecklist = computed(() => {
        return _checklist.value.sort((a, b) => {
            const nameA = a.name.toLowerCase(); // ignore upper and lowercase
            const nameB = b.name.toLowerCase(); // ignore upper and lowercase
            if (nameA < nameB) { return -1 }
            if (nameA > nameB) { return 1 }
            return 0;
        })
    })

    const addChecklistItem = (itemName) => {
        _checklist.value.push({
            uuid: uuid.v4(),
            name: itemName,
            checked: false,
        })
    }

    const deleteChecklistItem = (item) => {
        const index = _checklist.value.indexOf(item)
        _checklist.value.splice(index, 1)
    }

    const toggleChecklistItem = (item) => {
        _history.value.push(JSON.parse(JSON.stringify(item)))
        item.checked = !item.checked
    }

    const undoChecklistItem = () => {
        let oldItem = _history.value.pop()
        if(oldItem != undefined) {
            let currentItem = _checklist.value.find((item) => item.uuid == oldItem.uuid)
            if(currentItem != undefined) {
                currentItem.checked = oldItem.checked
            }
        }
    }

    return { _checklist, addChecklistItem, deleteChecklistItem, orderedChecklist, toggleChecklistItem, undoChecklistItem }
},
{
    persist: true,
})
