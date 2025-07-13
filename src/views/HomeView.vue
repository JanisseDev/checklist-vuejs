<template>
    <div class="main">
        <table class="list">
            <tbody>
                <template v-for="(item, index) in store.orderedChecklist">
                    <tr v-if="!item.checked || !hideCheckedMode">
                        <th class="col-label">
                            <label :for='"checkbox-input-"+index' class="item-label">{{ item.name }}</label>
                        </th>
                        <th class="col-actions" v-if="deleteMode">
                            <button class="item-action delete-button" @click="deleteItemAt(item)">
                                <img class="button-icon" :src='xmarkSolid'>
                            </button>
                        </th>
                        <th class="col-actions" v-else>
                            <input :id='"checkbox-input-"+index' class="item-action" type="checkbox" v-model="item.checked" />
                        </th>
                    </tr>
                </template>
                <tr>
                    <th class="col-actions" colspan="2">
                        <form @submit.prevent="onNewItem">
                            <input v-model="newItem" placeholder="New item here" @submit.prevent="onNewItem"/>
                        </form>
                    </th>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="footer">
        <button class="footer-button" @click="hideCheckedMode = !hideCheckedMode">
            <img class="button-icon" :src='hideCheckedMode ? eyeSlashSolid : eyeSolid'>
        </button>
        <button class="footer-button" @click="deleteMode = !deleteMode">
            <img class="button-icon" :src='trashSolid'>
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChecklistStore } from '@/stores/checklistStore'

import xmarkSolid from '@/assets/xmark-solid.svg'
import eyeSlashSolid from '@/assets/eye-slash-solid.svg'
import eyeSolid from '@/assets/eye-solid.svg'
import trashSolid from '@/assets/trash-solid.svg'

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
    align-items: flex-end;
    justify-content: center;
    margin: 8px;
    min-height: calc(100dvh - 50px - 16px);
}

.footer {
    position: fixed;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    height: 50px;
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background-color: var(--header-background);
}

button {
    position: relative;
}

.button-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.footer-button {
    height: 32px;
    width: 32px;
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

.col-label {
    text-align: right;
}

.col-actions {
    width: 20px;
    text-align: right;
}

.item-action {
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