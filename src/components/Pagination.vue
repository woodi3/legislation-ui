<template>
    <div class="pagination" ref="pagination">
        <ul>
            <li class="page-item" :class="{'disabled': currentPage <= 1}" @click="goTo(currentPage, currentPage-1)">
                <button 
                    class="page-btn"
                    :class="{disabled: currentPage <= 1}" 
                    :disabled="currentPage <= 1">
                    <arrow direction="left"/>
                </button>
            </li>
            <li v-if="currentPage > MAX_PAGES"
                class="page-item"
                @click="goTo(pagesToShow[0], pagesToShow[0]-1)">
                <button
                    class="page-btn disabled"
                    tabindex="-1">
                    ...
                </button>
            </li>
            <li class="page-item"
                v-for="p in pagesToShow" 
                :key="p"
                @click="goTo(p, p)">
                <button
                    class="page-btn"
                    :class="{inactive: currentPage !== p, 'active': currentPage === p}">
                    {{p}}
                </button>
            </li>
            <li v-if="pagesToShow[pagesToShow.length - 1]+1 <= totalPages.length"
                class="page-item"
                @click="goTo(pagesToShow[pagesToShow.length-1], pagesToShow[pagesToShow.length-1]+1)">
                <button
                    tabindex="-1"
                    class="page-btn disabled">
                    ...
                </button>
            </li>
            <li class="page-item" :class="{'disabled': currentPage >= totalPages.length}" @click="goTo(currentPage, currentPage+1)">
                <button 
                    class="page-btn"
                    :class="{disabled: currentPage >= totalPages.length}" 
                    :disabled="currentPage >= totalPages.length">
                    <arrow direction="right"/>
                </button>
            </li>
            <li class="page-item item-count">
                {{minIndex+1}} - {{maxIndex}} of {{totalItems}} items
            </li>
        </ul>
    </div>
</template>

<script>
import Arrow from './Arrow';

const MAX_PAGES = 15;

export default {
    components: {
        Arrow,
    },
    props: {
        totalItems: {
            type: Number,
            required: true
        },
        rowsPerPage: {
            type: Number,
            required: true
        },
    },
    data () {
        return {
            currentPage: 1,
            totalPages: [],
            pagesToShow: [],
            displayMinIndex: 1,
            displayMaxIndex: 0,
            MAX_PAGES: MAX_PAGES
        }
    },
    mounted () {
        this.setKeydownEvent()
        this.updatePagination()
    },
    beforeDestroy () {
        this.destroyKeydownEvent()
    },
    computed: {
        minIndex () {
            return (this.currentPage * this.rowsPerPage) - this.rowsPerPage
        },
        maxIndex () {
            const max = this.currentPage * this.rowsPerPage
            return max > this.totalItems ? this.totalItems : max
        }
    },
    methods: {
        updatePagination () {
            const numOfPages = Math.ceil(this.totalItems / this.rowsPerPage)
            this.totalPages = Array(numOfPages).fill(0).map((_, i) => ++i)
            this.pagesToShow = this.totalPages.slice(0, this.MAX_PAGES)
        },
        goTo (previousPage, nextPage) {
            if (nextPage > this.totalPages.length) {
                previousPage = this.totalPages.length - 1;
                nextPage = this.totalPages.length;
            }
            else if (nextPage < 1) {
                nextPage = 1
                previousPage = 2
            }
            let shiftPages = false
            if (previousPage > nextPage) {
                shiftPages = nextPage % this.MAX_PAGES === 0
                if (shiftPages && nextPage > 1) {
                    this.pagesToShow = this.totalPages.slice(nextPage - this.MAX_PAGES, nextPage)
                }
            }
            else if (nextPage > previousPage) {
                shiftPages = previousPage % this.MAX_PAGES === 0
                if (shiftPages && nextPage <= this.totalPages.length) {
                    this.pagesToShow = this.totalPages.slice(previousPage, (nextPage - 1) + this.MAX_PAGES)
                }
            }
            this.currentPage = nextPage
            const minIndex = this.minIndex
            const maxIndex = this.maxIndex
            this.$emit('changePage', { minIndex, maxIndex, currentPage: this.currentPage })
        },
        handleKeydown (event) {
            if (event.keyCode === 37 || event.key === "ArrowLeft") {
                // left arrow
                this.goTo(this.currentPage, this.currentPage-1)
            } 
            else if (event.keyCode === 39 || event.key === "ArrowRight") {
                // right arrow
                this.goTo(this.currentPage, this.currentPage+1)
            }
        },
        destroyKeydownEvent () {
            const pagination = this.$refs.pagination;
            pagination.removeEventListener('keydown', this.handleKeydown)
        },
        setKeydownEvent () {
            const pagination = this.$refs.pagination;
            pagination.setAttribute('tabindex', '-1')
            pagination.addEventListener('keydown', this.handleKeydown)
        },
    },
    watch: {
        rowsPerPage (newVal, oldVal) {
            if (newVal !== oldVal) {
                this.updatePagination()
            }
        },
        totalItems (newVal, oldVal) {
            if (newVal !== oldVal) {
                this.updatePagination()
            }
        }
    }
}
</script>

<style scoped>
.pagination > ul {
    display: flex;
    align-items: center;
    padding-left: 0;
    list-style: none;
    margin: 0px;
    width: 100%;
}
ul {
    padding-top: .25rem;
    padding-bottom: .25rem;
}
.page-item {
    padding: .25rem;
}
.page-btn {
    background-color: var(--primary);
    /* border-color: var(--primary);
    border-width: 1px; */
    border: none;
    padding-top: .25rem;
    padding-bottom: .25rem;
    margin-left: .25rem;
    border-radius: .25rem;
}
.page-btn.active, .page-btn:not(.disabled):hover, .page-btn:not(.disabled):focus {
    background-color: var(--light);
    cursor: pointer;
}
.item-count {
    margin-left: auto;
}
</style>