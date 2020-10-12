<template>
  <div id="app">
    <div class="search-container">
      <div class="title">
        <h1>What did they vote for?</h1>
      </div>
      <div class="search">
        <div>
          <select name="states" id="states" v-model="selectedState" @change="handleStateChange">
            <option value="">Select your state</option>
            <option v-for="state in stateOptions" :key="state.abbreviation" :value="state.abbreviation">
              {{state.name}}
            </option>
          </select>
        </div>
        <div>
          <select v-if="selectedState !== ''" name="congressPeople" id="congressPeople" v-model="selectedPerson" @change="handleCongressPersonChange">
            <option value="">Select your congress person</option>
            <option v-for="person in congressPeopleOptions" :key="person" :value="person">{{person}}</option>
          </select>
        </div>
        <div v-if="globalLoading">
          Loading...
        </div>
      </div>
    </div>
    <div v-if="hasSearches" ref="voteContainer" class="vote-results">
      <div class="accordion" v-for="person in activeSearches" :key="person.uuid">
        <div class="header" @click="toggleAccordion(person)">
          <h4 class="name">
              {{person.name}} ({{person.party}}, {{person.state}})
          </h4>
          <arrow :direction="person.open ? 'up' : 'down'"/>
        </div>
        <div class="content" v-if="person.open">
          <div class="votes">
            <vote-summary 
              v-for="(vote, voteIdx) in person.votes" 
              :key="`${person.uuid}_${vote.id}_${voteIdx}`" 
              :vote="vote"
            />
          </div>
          <div class="pagination-container">
            <pagination 
              :totalItems="person.paginationOpts.totalResults" 
              :rowsPerPage="person.paginationOpts.currentPageSize"
              @changePage="handlePageChange" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { search, getCongressPeople } from './api.service';
import { debounce, STATE_LIST } from './util.service';
import VoteSummary from './components/VoteSummary';
import Pagination from './components/Pagination';
import Arrow from './components/Arrow';

const SEARCH_DEBOUNCE = 250;

export default {
  name: 'App',
  components: {
    VoteSummary,
    Pagination,
    Arrow,
  },
  data () {
    return {
      searchVal: '',
      selectedState: '',
      selectedPerson: '',
      stateOptions: STATE_LIST,
      globalLoading: false,
      activeSearches: [],
      congressPeopleOptions: [],
    }
  },
  computed: {
    hasSearches () {
      return this.activeSearches.length > 0;
    },
    openSearch () {
      return this.findPerson('open', true);
    }
  },
  methods: {
    handleSearchBtnClick () {
      console.log("A SEARCH BTN WAS CLICKED!");
      // this.handleSearch(1);
    },
    async handleStateChange () {
      try {
        var data = await getCongressPeople(this.selectedState);
        if (!data) {
          throw new Error('No data from api!');
        }
        this.congressPeopleOptions = data;

      } catch (err) {
        console.log(err);
      }
    },
    handleCongressPersonChange () {
      this.handleSearch(this.selectedPerson, this.selectedState, 1);  
    },
    toggleAccordion (person) {
      person.open = !person.open;
    },
    async handleSearch (selectedPerson, selectedState, page) {
      var _performSearchFn = debounce(async function () {
        try {
          this.globalLoading = true;
          var data = await search(selectedPerson, selectedState, page);

          if (!data) {
            throw new Error('No data from api!');
          } 

          var { data:votes, ...opts} = data;
          let person;
          votes.forEach(vote => {
            const key = `${vote.name},${vote.state},${vote.party}`;
            person = this.findPerson('uuid', key);
            if (!person) {
              person = {};
              person.uuid = key;
              person.name = vote.name;
              person.state = vote.state;
              person.party = vote.party;
              person.votes = [];
              person.open = false;
              this.activeSearches.push(person);
            }
            person.votes.push(vote);
          });
          person.paginationOpts = opts;
          if (person.paginationOpts.currentPage > 1) {
            person.votes = person.votes.slice(100);
          }
        } catch (err) {
          // TODO display error
          console.error(err);
        }
        this.globalLoading = false;
      }.bind(this), SEARCH_DEBOUNCE);
      return new Promise(function resolver(resolve) {
        _performSearchFn();
        resolve();
      }.bind(this));
    },
    findPerson (key, value) {
      return this.activeSearches.find(p => p[key] == value);
    },
    handlePageChange (page) {
      const person = this.findPerson('open', true);
      if (person) {
        this.handleSearch(person.name, person.state, page.currentPage);
      }
    },
  }
}
</script>

<style>
:root {
  --primary: #9792E3;
  --accent: #61E786;
  --light: #EDFFEC;
  --dark: #5A5766;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: var(--primary);
}
#app {
  height: 250px;
  background-color: var(--primary);
}
.search-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 1rem;
}
.pagination {
  display: flex;
  flex-direction: row;
  padding-top: .5rem;
  padding-bottom: .5rem;
}
.pagination > .item {
  margin-left: .25rem;
  margin-right: .25rem;
  padding-left: .5rem;
  padding-right: .5rem;
}
.pagination > .item:hover, .pagination > .item.active { 
  background-color: var(--light);
}
.pagination > .item:hover {
  cursor: pointer;
}
.search-container > .title {
  flex: 0 0 25%;
  width: 100%;
  text-align: center;
}
.search-container > .title > h1 {
  margin: 0;
}
.search-container > .search {
  flex: 0 0 25%;
  width: 100%;
  text-align: center;
}
.search > input {
  min-width: 250px;
  padding-top: .25rem;
  padding-bottom: .25rem;
  padding-left: .25rem;
  padding-right: .25rem;
  border-radius: .25rem;
  border-color: var(--light);
  outline: none;
  border-width: 1px;
}
.search > button {
  background-color: var(--accent);
  border-color: var(--accent);
  border-width: 1px;
  padding-top: .25rem;
  padding-bottom: .25rem;
  margin-left: .25rem;
  border-radius: .25rem;
}
.vote-results {
  height: 475px;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.accordion {
  height: 100%;
  flex: 0 0 75%;
}
.accordion > .header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: .5rem;
  padding-bottom: .5rem;
}
.accordion > .header > h4 {
  margin: 0;
}
.accordion > .content > .votes {
  height: 350px;
  flex: 0 0 75%;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

</style>
