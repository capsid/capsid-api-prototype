import { buildQuery } from "@arranger/middleware";

export default sqon =>
  sqon ? buildQuery({ nestedFields: [], filters: sqon }) : null;
