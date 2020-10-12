<template>
    <span class="arrow" :class="[direction]"></span>
</template>

<script>
export default {
    props: {
        direction: {
            required: true
        }
    }
}
</script>

<style scoped>
.arrow {
    border: solid var(--dark);
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: .25rem;
    max-height: 5px;
    max-width: 5px;
}
.arrow.right {
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
}
.arrow.left {
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
}
.arrow.up {
    transform: rotate(225deg);
    -webkit-transform: rotate(225deg);
}
.arrow.down {
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
}
</style>