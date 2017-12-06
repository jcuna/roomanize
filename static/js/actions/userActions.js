import api from '../utils/api'


export function login(username, password) {

}

export function getUser() {
    return function (dispatch) {
        dispatch({
            type: "USER_FETCHING",
        });
        api({url: '/user'}).then(data => {
            if (data.status < 300) {
                dispatch({
                    type: "USER_RECEIVED",
                    payload: data.data
                });
            } else {
                dispatch({
                    type: "USER_MUST_LOGIN",
                    payload: data.message
                })
            }
        }, err => {
            dispatch({
                type: "USER_GET_ERROR",
                payload: err.error
            })
        });
    }
}
