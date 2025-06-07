# History of API development

## Ergast API details
After Ergast API was deprecated and eventually stop working the only choice was to
use Jolpi API to fetch required data. Jolpi API differ from Ergast in a way that
data format and some of the properties available in Ergast data is not available
anymore. To be able to get list of season winners now we need to fetch races
results from https://api.jolpi.ca/ergast/f1/results/. Jolpi API return list of
Races starting from 1950. To fetch data for last 25 years we need to calculate
offset parameter from total value of items in a list. And total number is an 
umber of rounds. Each season might have different number of rounds.

## Database data population
When we wanted to use two Jolpi API endpoints to fetch list of race results
for all and specific season. We planned to create **Driver**, **Constructor**
and **Circuit** models to store uniq items in DB. When each of the endpoint
fetch data we created models from this data and inserted to DB. Each of the
call returned similar data but not equal data structure. We filled some
props. with empty values expecting that second part of the data will be available
from another call. Then we can update record in DB and model will be complete. Therefor copies of the items was inserted.
This is poor design. Possible to implement but very complex. After several attempts
to build working PoC decision was made to search for different solution.

## Way to resolve API diff and database population
Instead of using single call to Jolpi API we can run multiple query to 
https://api.jolpi.ca/ergast/f1/{season}/driverstandings/ where season is
taken from initial seasons list to get. App user will be able to see first
25 season winners on home page. Then we can fill in **Winner** model next
to the uniq **Driver** and **Constructor** and reference them to Winner via id's.
This way we would have single source of data, uniq models and update BD
after user start to scroll to see older seasons. **Initial range - [2025-2000]** 

