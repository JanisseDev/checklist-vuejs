<template>
    <div class="main">
        <div class="header">
            <button class="header-button" @click="hideCheckedMode = !hideCheckedMode">{{ hideCheckedMode ? 'Show checked' : 'Hide checked'}}</button>
            <button class="header-button" @click="deleteMode = !deleteMode">Delete mode</button>
        </div>
        <table class="list">
            <tbody>
                <template v-for="(item) in store.orderedChecklist">
                <tr v-if="!item.checked || !hideCheckedMode">
                    <th class="col1" v-if="deleteMode">
                            <button class="col1-item delete-button" @click="deleteItemAt(item)">x</button>
                        </th>
                        <th class="col1" v-else>
                            <input class="col1-item" type="checkbox" v-model="item.checked" />
                        </th>
                        <th>
                            {{ item.name }}
                        </th>
                    </tr>
                </template>
                <tr>
                    <th colspan="2">
                        <form @submit.prevent="onNewItem">
                            <input v-model="newItem" placeholder="New item here" @submit.prevent="onNewItem"/>
                        </form>
                    </th>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChecklistStore } from '@/stores/checklistStore'

const store = useChecklistStore()
const newItem = ref("")
const hideCheckedMode = ref(true)
const deleteMode = ref(false)

function onNewItem() {
    store.checklist.push({
        name: newItem.value,
        checked: false,
    })
    newItem.value = ""
}

function deleteItemAt(item) {
    const index = store.checklist.indexOf(item)
    store.checklist.splice(index, 1)
}
</script>

<style scoped>
.main {
    display: flex;
    justify-content: center;
    margin-top: 50px;
}

.header {
    position: fixed;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    top: 0px;
    left: 0px;
    right: 0px;
    background-color: var(--header-background);
}

.header-button {
    border: 0;
    border-radius: 50vh;
    padding: 8px 16px;
    background-color: var(--primary);
}

.list {
    width: 100%;
    max-width: 800px;
    padding: 16px;
    border-radius: 16px;
    background-color: var(--list-background);
    text-align: left;
}

.col1 {
    width: 20px;
}

.col1-item {
    width: 20px;
    height: 20px;
    margin: 8px;
    padding: 0px;
}

.delete-button {
    border: 0px;
    border-radius: 50%;
    background-color: var(--destructive);
    color: white;
}
</style>