import {watchApp} from './app_sagas';
import {all, fork} from 'redux-saga/effects';
import {watchNewsIndex} from './news/news_index_sagas';
import {watchQuestionDetail} from './question/question_detail_sagas';
import {watchKnowledgeBaseIndex} from './knowledgeBase/knowledgeBase_index_sagas';
import {watchProfileIndex} from './profile/profile_index_sagas';

export default function* rootSaga() {
  yield all([
    fork(watchApp),
    fork(watchNewsIndex),
    fork(watchQuestionDetail),
    fork(watchKnowledgeBaseIndex),
    fork(watchProfileIndex),
  ]);
}
