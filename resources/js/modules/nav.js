/*
|-------------------------------------------------------------------------------
| VUEX modules/nav.js
|-------------------------------------------------------------------------------
| The Vuex data store for the nav
*/
import Collapse from 'bootstrap/js/dist/collapse';

export const nav = {
    state: () => ({ collapse: null, }), // holds Bootstrap collapse object
    actions: {
        setNavCollapse({ commit }, collapse) {
            commit('setNavCollapse', new Collapse(collapse, {
                toggle: false,
            }));
        }
    },
    mutations: {
        setNavCollapse(state, collapse) {
            state.collapse = collapse;
        },
    },
    getters: {
        getNavCollapse(state) {
            return state.collapse;
        },
    },
}
