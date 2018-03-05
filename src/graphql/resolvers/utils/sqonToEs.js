import FilterProcessor from "@arranger/middleware/dist/filters";

export default sqon =>
  sqon ? new FilterProcessor().buildFilters("", [], sqon) : null;
