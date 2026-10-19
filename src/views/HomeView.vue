<template>
    <div class="app">
        <header class="header">
            <div class="header-row">
                <h1 class="title">
                    <button class="title-button" aria-haspopup="dialog" @click="listPicker.open()">
                        <span class="title-text">{{ store.currentList.name }}</span>
                        <AppIcon name="chevronDown" />
                    </button>
                </h1>
                <span v-if="total > 0" class="progress-label">{{ store.checkedCount }} / {{ total }}</span>
            </div>
            <div v-if="total > 0" class="progress" role="progressbar" aria-label="Progress"
                :aria-valuenow="store.checkedCount" aria-valuemin="0" :aria-valuemax="total">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
        </header>

        <main class="content">
            <div v-if="total === 0" class="empty">
                <p class="empty-title">Your list is empty</p>
                <p class="empty-text">Add your first item below.</p>
            </div>
            <div v-else-if="visibleItems.length === 0" class="empty">
                <p class="empty-title">All done!</p>
                <p class="empty-text">Every item is checked.</p>
            </div>

            <TransitionGroup :key="store.currentList.uuid" tag="ul" name="item" class="list">
                <li v-for="item in visibleItems" :key="item.uuid" class="item"
                    :class="{ 'is-checked': item.checked, 'is-highlighted': item.uuid === highlightedUuid }">
                    <label class="item-row">
                        <input class="checkbox-input" type="checkbox" :checked="item.checked"
                            @change="store.toggleChecklistItem(item)" />
                        <span class="checkbox-box"><AppIcon name="check" /></span>
                        <span class="item-name">{{ item.name }}</span>
                    </label>
                    <button v-if="editMode" class="icon-button delete-button" :aria-label="`Delete ${item.name}`"
                        @click="store.deleteChecklistItem(item)">
                        <AppIcon name="x" />
                    </button>
                </li>
            </TransitionGroup>

            <button v-if="hideChecked && store.checkedCount > 0" class="hidden-note" @click="hideChecked = false">
                {{ store.checkedCount }} checked {{ store.checkedCount > 1 ? 'items' : 'item' }} hidden · Show
            </button>
        </main>

        <footer class="footer">
            <form class="add-form" @submit.prevent="onNewItem">
                <input ref="newItemInput" v-model="newItem" class="add-input" placeholder="Add an item"
                    aria-label="New item" enterkeyhint="done" autocomplete="off" />
                <button class="icon-button add-button" type="submit" aria-label="Add item"
                    :disabled="!newItem.trim()">
                    <AppIcon name="plus" />
                </button>
            </form>
            <div class="toolbar">
                <button class="icon-button tool-button" :class="{ 'is-active': editMode }" :aria-pressed="editMode"
                    :title="editMode ? 'Done editing' : 'Delete items'" @click="editMode = !editMode">
                    <AppIcon name="trash" />
                    <span class="tool-label">{{ editMode ? 'Done' : 'Delete' }}</span>
                </button>
                <div class="spacer"></div>
                <button class="icon-button tool-button" title="Uncheck all" aria-label="Uncheck all"
                    :disabled="store.checkedCount === 0" @click="store.uncheckAll()">
                    <AppIcon name="reset" />
                </button>
                <button class="icon-button tool-button" title="Undo" aria-label="Undo"
                    :disabled="!store.canUndo" @click="store.undoChecklistItem()">
                    <AppIcon name="undo" />
                </button>
                <button class="icon-button tool-button" :class="{ 'is-active': !hideChecked }"
                    :aria-pressed="!hideChecked" :title="hideChecked ? 'Show checked items' : 'Hide checked items'"
                    aria-label="Show checked items" @click="hideChecked = !hideChecked">
                    <AppIcon :name="hideChecked ? 'eyeOff' : 'eye'" />
                </button>
            </div>
        </footer>

        <ListPicker ref="listPicker" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChecklistStore } from '@/stores/checklistStore'
import AppIcon from '@/components/AppIcon.vue'
import ListPicker from '@/components/ListPicker.vue'

const store = useChecklistStore()
const newItem = ref('')
const newItemInput = ref(null)
const listPicker = ref(null)
const hideChecked = ref(true)
const editMode = ref(false)
const highlightedUuid = ref(null)
let highlightTimeout = null

const total = computed(() => store.items.length)
const progress = computed(() => (total.value ? (store.checkedCount / total.value) * 100 : 0))
const visibleItems = computed(() =>
    hideChecked.value ? store.orderedChecklist.filter((item) => !item.checked) : store.orderedChecklist
)

function onNewItem() {
    const item = store.addChecklistItem(newItem.value)
    if (!item) return
    newItem.value = ''
    newItemInput.value?.focus()
    highlight(item)
}

// Briefly highlight an item so the user sees where it landed (or that it already existed)
function highlight(item) {
    clearTimeout(highlightTimeout)
    highlightedUuid.value = item.uuid
    highlightTimeout = setTimeout(() => { highlightedUuid.value = null }, 1200)
}
</script>

<style scoped>
.app {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    max-width: 640px;
    margin: 0 auto;
}

/* Header */
.header {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
    background-color: var(--background);
}

.header-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
}

.title {
    min-width: 0;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.title-button {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: calc(100% + 8px);
    margin: -4px 0 -4px -8px;
    padding: 4px 8px;
    border: 0;
    border-radius: 10px;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.title-button:hover {
    background-color: var(--surface-muted);
}

.title-button:focus-visible {
    outline: 2px solid var(--primary);
}

.title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.title-button .icon {
    color: var(--text-muted);
}

.progress-label {
    color: var(--text-muted);
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
}

.progress {
    height: 4px;
    margin-top: 8px;
    border-radius: 2px;
    background-color: var(--surface-muted);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 2px;
    background-color: var(--primary);
    transition: width 0.3s ease;
}

/* List */
.content {
    flex-grow: 1;
    padding: 0 16px 16px;
}

.list {
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.item {
    display: flex;
    align-items: center;
    border-radius: 12px;
    background-color: var(--surface);
    border: 1px solid var(--border);
    transition: background-color 0.3s ease;
}

.item.is-highlighted {
    background-color: var(--primary-soft);
}

.item-row {
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    min-height: 52px;
    padding: 8px 14px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.checkbox-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
}

.checkbox-box {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    border: 2px solid var(--border-strong);
    border-radius: 7px;
    color: transparent;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.checkbox-box .icon {
    width: 16px;
    height: 16px;
    stroke-width: 3;
}

.checkbox-input:checked + .checkbox-box {
    background-color: var(--primary);
    border-color: var(--primary);
    color: var(--on-primary);
}

.checkbox-input:focus-visible + .checkbox-box {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

.item-name {
    overflow-wrap: anywhere;
    line-height: 1.35;
}

.is-checked .item-name {
    color: var(--text-muted);
    text-decoration: line-through;
}

.hidden-note {
    display: block;
    margin: 12px auto 0;
    padding: 8px 14px;
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--text-muted);
    font: inherit;
    font-size: 0.875rem;
    cursor: pointer;
}

.hidden-note:hover {
    background-color: var(--surface-muted);
}

/* Empty state */
.empty {
    padding: 48px 16px;
    text-align: center;
}

.empty-title {
    margin: 0 0 4px;
    font-size: 1.125rem;
    font-weight: 600;
}

.empty-text {
    margin: 0;
    color: var(--text-muted);
}

/* Footer */
.footer {
    position: sticky;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px calc(8px + env(safe-area-inset-bottom));
    background-color: var(--surface-muted);
    border-top: 1px solid var(--border);
    border-radius: 16px 16px 0 0;
}

.add-form {
    display: flex;
    gap: 8px;
}

.add-input {
    flex-grow: 1;
    min-width: 0;
    height: 44px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background-color: var(--surface);
    color: var(--text);
    font: inherit;
}

.add-input:focus {
    outline: 2px solid var(--primary);
    outline-offset: -1px;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
}

.spacer {
    flex-grow: 1;
}

/* Buttons */
.tool-button:not(:disabled):hover {
    background-color: var(--border);
}

.tool-button.is-active {
    background-color: var(--primary-soft);
}

.tool-label {
    font-size: 0.875rem;
    font-weight: 500;
}

.add-button {
    background-color: var(--primary);
    color: var(--on-primary);
}

.delete-button {
    margin-right: 6px;
    color: var(--destructive);
}

.delete-button:hover {
    background-color: var(--destructive-soft);
}

/* List animations */
.item-move,
.item-enter-active,
.item-leave-active {
    transition: transform 0.25s ease, opacity 0.25s ease;
}

.item-enter-from,
.item-leave-to {
    opacity: 0;
    transform: translateX(-12px);
}

.item-leave-active {
    position: absolute;
    left: 0;
    right: 0;
}

@media (prefers-reduced-motion: reduce) {
    .item-move,
    .item-enter-active,
    .item-leave-active,
    .progress-fill {
        transition: none;
    }
}
</style>
