<template>
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path v-for="d in paths[name]" :key="d" :d="d" />
    </svg>
</template>

<script setup>
defineProps({
    name: { type: String, required: true },
})

const paths = {
    plus: ['M12 5v14', 'M5 12h14'],
    x: ['M18 6 6 18', 'M6 6l12 12'],
    trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M10 11v6', 'M14 11v6'],
    undo: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
    reset: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
    eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
    eyeOff: [
        'M9.88 9.88a3 3 0 1 0 4.24 4.24',
        'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68',
        'M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61',
        'M2 2l20 20',
    ],
    check: ['M20 6 9 17l-5-5'],
    pencil: ['M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z', 'm15 5 4 4'],
    chevronDown: ['m6 9 6 6 6-6'],
}
</script>

<style scoped>
.icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}
</style>
