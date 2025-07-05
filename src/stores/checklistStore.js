import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useChecklistStore = defineStore('checklist', () => {
    const checklist = ref([])

    const orderedChecklist = computed(() => {
        return checklist.value.sort((a, b) => {
            const nameA = a.name.toLowerCase(); // ignore upper and lowercase
            const nameB = b.name.toLowerCase(); // ignore upper and lowercase
            if (nameA < nameB) { return -1 }
            if (nameA > nameB) { return 1 }
            return 0;
        })
    })

    return { checklist, orderedChecklist }
},
{
    persist: true,
})
