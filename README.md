# capsid-api-prototype
next-gen capsid api

Install docker - https://docs.docker.com/docker-for-mac/install/

In one terminal run `docker-compose up`
Go to http://localhost:5601 to see kibana dashboard

In another run:
 - npm install
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

#### yarn index:seed
`yarn index:seed` responds to the following arguments:
 - N_PROJECTS // total number of projects (default 10)
 - N_SAMPLES // number of samples per project (default 40)
 - N_ALIGNMENTS // number of alignments per sample (default 2)
 - N_GENOMES // total number of genomes (default 16,000)
