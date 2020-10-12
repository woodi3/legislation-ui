<template>
    <div class="vote">
        <h3 class="title">
            {{vote.title}}
        </h3>
        <h4 class="name">
            {{vote.name}} ({{vote.party}}, {{vote.state}})
        </h4>
        <p class="cast">{{convertVoteCast(vote.voteCast)}}</p>
    </div>
</template>

<script>
export default {
    props: {
        vote: {
            required: true,
            type: Object
        }
    },
    methods: {
        convertVoteCast (voteCast) {
            switch (voteCast.toLowerCase()) {
                case 'nay':
                    return 'X';
                case 'yea':
                    return 'Check';
                case 'not voting':
                    return 'No Vote';
                default:
                    return 'N/A';
            }
        }
    }
}
</script>

<style scoped>
h3,
h4,
p {
    margin: 0;
}
.vote {
    flex: 0 0 31%;
    padding: .5rem;
    margin-top: .5rem;
    margin-bottom: .5rem;
    margin-left: .25rem;
    margin-right: .25rem;
    background-color: #fff;
    border-radius: 1rem;
}
.vote:hover {
    box-shadow: 0 .25rem .5rem 0 rgba(0,0,0,0.2);
    cursor: pointer;
}
.vote .name, .vote .title, .vote .cast {
    padding-top: .25rem;
    padding-bottom: .25rem;
}
.vote .title {
    font-weight: normal;
}
</style>