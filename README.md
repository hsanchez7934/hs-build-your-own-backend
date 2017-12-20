######BYOB#######

This backend application provides a user with a list of the 32 top luxury watch
brands.  The dataset also contains price information and model name of five watches
per brand.


The API is REST API and uses OAuth 1.0a for user authentication purposes. Currently, return format for all endpoints is JSON.

You can apply for a for a web token at the main page.  Email must end with turing.io to have admin access.
[BYOB Link](https://hs-byob-12-17-2017.herokuapp.com/)

------------------------------------------------------------------------------------------------------------------------------

### GET Brands ###

/api/v1/brands

Make a get request to this endpoint to retrieve a list of the 32 top luxury watch brands

Example of response format:


![JSON Reponse](./assets/getbrands.png)


### Get Watch Models ###

/api/v1/brand/:id/watches

Make a get request to this endpoint to retrieve a list of five watch models by brand.  Response will provide
watch price, model name, model brand, and brand_id.  

Must pass in brand id as a param in URL.

Example of response format:


![JSON Reponse](./assets/watchmodels.png)
