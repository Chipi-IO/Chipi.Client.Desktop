import { chipiSearch } from "../../../../lib/chipi";

const getSearchResults = ({ term, filters }) => {
  return chipiSearch.searchAllAsync({
    term,
    filters: filters && filters.map(filter => filter.value)
  });
};

const getThreadResultsAsync = async threadId => {
  return chipiSearch.searchThreadAsync(threadId);
};

export default {
  getSearchResults,
  getThreadResultsAsync
};
