const express = require('express')
const Immutable = require('immutable')
const app = express()
const fs = require('fs')

// This limit will never be hit in this demo, adjust to 2 to test.
const maxCacheSize = 50000;
let cache = Immutable.List(); // Initial empty cache

const updateCache = (item) => {
    // If the cache is at max size, then remove first item before pushing
    if (cache.size === maxCacheSize) cache = cache.shift();

    // Update cache with new item
    cache = cache.push(item);
}

const getCache = () => cache;

// This mocks calling an API for results;
const sales_tax_lookup = (addressObj) => {
    // Convert API/JSON response to Immutable structure
    const file = fs.readFileSync('data.json', 'utf-8')
    const data = Immutable.fromJS(JSON.parse(file).data);

    // Remove tax rate, since we don't know that yet
    return data.find(address => address.delete('taxRate').equals(addressObj));
}

// This will return the value from a cache or call an API
// API result is cached and then returned.
const fast_rate_lookup = (addressObj) => {
    const cache = getCache();
    const cachedResult = cache.find(address => address.delete('taxRate').equals(addressObj));

    if (cachedResult) {console.log('returing from cache'); return cachedResult};

    const apiResult = sales_tax_lookup(addressObj);

    updateCache(apiResult);
    console.log('returning from API');
    return apiResult;
}

// This would come from user input
const userAddress1 = Immutable.Map({
    street: '123 Kapahulu St',
    city: 'Honolulu',
    state: 'HI',
    postalCode: '96815',
});
const userAddress2 = Immutable.Map({
    street: '567 Kahala St',
    city: 'Honolulu',
    state: 'HI',
    postalCode: '96816',
});
const userAddress3 = Immutable.Map({
    street: '123 Nimitz Blvd',
    city: 'Honolulu',
    state: 'HI',
    postalCode: '96817',
});
// This user is a dup, should return from cache, unless max cache is less than 3
const userAddress4 = Immutable.Map({
    street: '123 Kapahulu St',
    city: 'Honolulu',
    state: 'HI',
    postalCode: '96815',
});

// You can move these lines around to see different api/cache responses.
console.log('User 1 Tax Rate', fast_rate_lookup(userAddress1).get('taxRate'));
console.log('User 2 Tax Rate', fast_rate_lookup(userAddress2).get('taxRate'));
console.log('User 3 Tax Rate', fast_rate_lookup(userAddress3).get('taxRate'));
console.log('User 4 Tax Rate', fast_rate_lookup(userAddress4).get('taxRate'));

console.log('Cache Size', getCache().toJS());

app.get('/', (req, res) => {
    res.send('Look in the node console to see the output!')
})

app.listen(3000, () => console.log(`App is live!`))