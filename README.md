# capsid-api-prototype
next-gen capsid api

Install docker - https://docs.docker.com/docker-for-mac/install/

In one terminal run `docker-compose up`
Go to http://localhost:5601 to see kibana dashboard

In another run:
 - npm install
 - yarn index:create
 - yarn index:seed
 - yarn start

Then go to http://localhost:8080/playground and run the query:

```
{
  projects {
    hits {
       _source {
        name
      }
    }
  }
}
```