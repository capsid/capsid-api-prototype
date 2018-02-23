import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { Genome } from "@capsid/mongo/schema/genomes";
import GenomeEsTC from "@capsid/es/schema/genomes";
import { SampleTC } from "@capsid/graphql/samples";

export const GenomeTC = composeWithMongoose(Genome);

GenomeTC.addRelation("samples_", {
  resolver: () => SampleTC.getResolver("findByIds"),
  prepareArgs: { _ids: x => x.samples },
  projection: { samples: true }
});

addFromMongoRelation({ elasticTC: GenomeEsTC, mongoTC: GenomeTC });
