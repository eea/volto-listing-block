import React from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { getVocabulary } from '@plone/volto/actions/vocabularies/vocabularies';

export const BENCHMARK_LEVEL_VOCABULARY = 'collective.taxonomy.benchmark_level';

const getVocabularyState = (state) =>
  state.vocabularies?.[BENCHMARK_LEVEL_VOCABULARY];

/**
 * Returns the benchmark level vocabulary items, loading the vocabulary on
 * first use. Only cards that display the benchmark level call it.
 */
export default function useBenchmarkLevels() {
  const dispatch = useDispatch();
  const store = useStore();
  const items = useSelector((state) => getVocabularyState(state)?.items);

  React.useEffect(() => {
    // read the fresh state, sibling cards may have already started the request
    const vocabulary = getVocabularyState(store.getState());
    if (!vocabulary?.loaded && !vocabulary?.loading) {
      dispatch(getVocabulary({ vocabNameOrURL: BENCHMARK_LEVEL_VOCABULARY }));
    }
  }, [dispatch, store]);

  return items;
}
