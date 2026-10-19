<template>
    <dialog ref="dialog" class="sheet" aria-labelledby="list-picker-title" @click="onBackdropClick" @close="reset">
        <div class="sheet-header">
            <h2 id="list-picker-title" class="sheet-title">Lists</h2>
            <button class="icon-button" aria-label="Close" @click="close">
                <AppIcon name="x" />
            </button>
        </div>

        <ul class="lists">
            <li v-for="list in store._lists" :key="list.uuid" class="list-row"
                :class="{ 'is-current': list.uuid === store.currentList.uuid }">
                <form v-if="editingId === list.uuid" class="rename-form" @submit.prevent="saveRename(list)">
                    <input ref="renameInput" v-model="editName" class="text-input" aria-label="List name"
                        enterkeyhint="done" autocomplete="off" @keydown.esc.stop.prevent="editingId = null"
                        @blur="saveRename(list)" />
                </form>
                <button v-else class="list-select" :aria-current="list.uuid === store.currentList.uuid"
                    @click="select(list)">
                    <span class="list-name">{{ list.name }}</span>
                    <span class="list-count">{{ remaining(list) }}</span>
                </button>

                <template v-if="editingId !== list.uuid">
                    <button v-if="confirmDeleteId === list.uuid" class="icon-button confirm-delete"
                        @click="remove(list)">
                        Delete?
                    </button>
                    <template v-else>
                        <button class="icon-button" :aria-label="`Rename ${list.name}`" @click="startRename(list)">
                            <AppIcon name="pencil" />
                        </button>
                        <button class="icon-button delete-button" :aria-label="`Delete ${list.name}`"
                            :disabled="store._lists.length <= 1" @click="confirmDeleteId = list.uuid">
                            <AppIcon name="trash" />
                        </button>
                    </template>
                </template>
            </li>
        </ul>

        <form class="new-list-form" @submit.prevent="create">
            <input v-model="newListName" class="text-input" placeholder="New list" aria-label="New list name"
                enterkeyhint="done" autocomplete="off" />
            <button class="icon-button primary-button" type="submit" aria-label="Create list"
                :disabled="!newListName.trim()">
                <AppIcon name="plus" />
            </button>
        </form>
    </dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useChecklistStore } from '@/stores/checklistStore'
import AppIcon from '@/components/AppIcon.vue'

const store = useChecklistStore()
const dialog = ref(null)
const renameInput = ref([])
const newListName = ref('')
const editingId = ref(null)
const editName = ref('')
const confirmDeleteId = ref(null)

const remaining = (list) => {
    const left = list.items.filter((item) => !item.checked).length
    return left === 0 && list.items.length > 0 ? 'Done' : `${left} left`
}

function open() {
    dialog.value.showModal()
}

function close() {
    dialog.value.close()
}

function reset() {
    editingId.value = null
    confirmDeleteId.value = null
    newListName.value = ''
}

// Clicks outside the sheet land on the <dialog> element itself (its backdrop)
function onBackdropClick(event) {
    if (event.target === dialog.value) close()
}

function select(list) {
    store.selectList(list)
    close()
}

function create() {
    if (store.addList(newListName.value)) close()
}

async function startRename(list) {
    confirmDeleteId.value = null
    editingId.value = list.uuid
    editName.value = list.name
    await nextTick()
    renameInput.value[0]?.select()
}

function saveRename(list) {
    if (editingId.value !== list.uuid) return
    store.renameList(list, editName.value)
    editingId.value = null
}

function remove(list) {
    store.deleteList(list)
    confirmDeleteId.value = null
}

defineExpose({ open, close })
</script>

<style scoped>
.sheet {
    width: 100%;
    max-width: 640px;
    max-height: 80dvh;
    margin: auto auto 0;
    padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border: 0;
    border-radius: 20px 20px 0 0;
    background-color: var(--background);
    color: var(--text);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.sheet:not([open]) {
    display: none;
}

.sheet::backdrop {
    background-color: rgb(0 0 0 / 0.4);
}

.sheet[open] {
    animation: slide-up 0.2s ease-out;
}

@keyframes slide-up {
    from { transform: translateY(24px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
    .sheet[open] { animation: none; }
}

.sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sheet-title {
    margin: 0;
    font-size: 1.25rem;
}

.lists {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.list-row {
    display: flex;
    align-items: center;
    gap: 2px;
    padding-right: 4px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background-color: var(--surface);
}

.list-row.is-current {
    border-color: var(--primary);
    box-shadow: inset 0 0 0 1px var(--primary);
}

.list-select {
    flex-grow: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 52px;
    padding: 8px 14px;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.list-select:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
    border-radius: 12px;
}

.list-name {
    overflow-wrap: anywhere;
}

.is-current .list-name {
    font-weight: 600;
}

.list-count {
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 0.875rem;
}

.rename-form {
    flex-grow: 1;
    padding: 4px;
}

.text-input {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    box-sizing: border-box;
    border: 1px solid var(--border);
    border-radius: 10px;
    background-color: var(--surface);
    color: var(--text);
    font: inherit;
}

.text-input:focus {
    outline: 2px solid var(--primary);
    outline-offset: -1px;
}

.icon-button:not(:disabled):hover {
    background-color: var(--surface-muted);
}

.delete-button {
    color: var(--destructive);
}

.confirm-delete {
    background-color: var(--destructive);
    color: var(--on-primary);
    font-size: 0.875rem;
    font-weight: 600;
}

.confirm-delete:hover {
    background-color: var(--destructive) !important;
}

.new-list-form {
    display: flex;
    gap: 8px;
}

.primary-button {
    background-color: var(--primary);
    color: var(--on-primary);
}

.primary-button:not(:disabled):hover {
    background-color: var(--primary);
}
</style>
