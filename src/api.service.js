import axios from 'axios';

const DEV_URL = 'http://localhost:3000/api/v1';
// TODO UPDATE PROD URL
const PROD_URL = DEV_URL;
const BASE_API_URL = process.env.NODE_ENV == 'production' ? PROD_URL : DEV_URL;
const TIMEOUT = 5000;
const MIN_STR_LENGTH = 3;

const instance = axios.create({
    baseURL: BASE_API_URL,
    timeout: TIMEOUT
});

export function search (name, state, page) {
    if (page == undefined) {
        page = 1;
    }
    var params = new URLSearchParams();
    params.append('page', page);
    if (strPasses(name, true)) {
        params.append('name', name);
    }
    if (strPasses(state)) {
        params.append('state', state);
    }
    if (params.toString().indexOf('name') == -1 && params.toString().indexOf('state') == -1){
        return null;
    } 
    return instance.get(`/search?${params.toString()}`)
        .then(function _handleSearchResponse (response) {
            if (response.data) {
                return response.data;
            }
            return null;
        });
}
export function getCongressPeople (state) {
    if (state == undefined) {
        throw new Error ('undefined state provided');
    }
    var params = new URLSearchParams();
    params.append('state', state);
    return instance.get(`/congress?${params.toString()}`)
        .then(function _handleGetCongressPeopleResponse(response) {
            if (response.data) {
                return response.data;
            }
            return null;
        });
}
function strPasses (str, doLengthCheck) {
    if (str != undefined) {
        str = str.toString().trim();
        if (!doLengthCheck) {
            return str != '';
        }
        return str != '' && str.length >= MIN_STR_LENGTH;
    }
    return false;
}