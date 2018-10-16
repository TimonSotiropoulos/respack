'use strict';
// *******************************************************
// Respack
// -------------------------------------------------------
// The inner workings of the respack module
// -------------------------------------------------------

// *******************************************
// Module Imports
// -------------------------------------------
import axios from 'axios';
// --------------------------------

// *******************************************
// Implementation
// -------------------------------------------
const OKAY = 'OKAY';
const FAILED = 'FAILED';
const ERROR = 'ERROR';

const GET = (url) => {
    return axios(url, getRequestParams())
    .then(handleResponse)
    .catch(handleError);
}

const POST = (url, body) => {
    return axios(url, postRequestParams(body))
    .then(handleResponse)
    .catch(handleError);
}

const sendOkay = (body) => {
    return {
        status: OKAY,
        body: body || {}
    };
};

const sendFailed = (body) => {
    return {
        status: FAILED,
        body: body
    };
};

const sendError = (body) => {
    return {
        status: ERROR,
        body: body
    };
};

const handleResponse = (res) => {
    switch(res.data.status) {
        case OKAY:
            if (res.status === 200) {
                return sendOkay(res.data.body);
            } else {
                return {status: ERROR, error: "Server Error..."};
            }
        case FAILED:
            return sendFailed(res.data.body);
        case ERROR:
            return sendError(res.data.body);
        default:
            return sendError(res.data.body);
    }
}

const handleError = (err) => {
    if (err) {
        return err;
    } else {
        return undefined;
    }

}

const safeAsync = async (promise, req, res) => {
    return promise
    .then((result) => {
        switch(result.status) {
            case OKAY:
                return result.body;
            case FAILED:
                sendFailed(res, result.body);
                return null;
            case ERROR:
                sendError(res, result.body);
                return null;
            default:
                console.warn("We fell through all the RESPACK checks.");
                console.warn("Something is DANGEROUSLY wrong!!!!");
                return null;
        }
    })
    .catch((err) => {
        sendError(res, err.message);
        return null;
    });
};


/**
 * @function getRequestParams
 * Generates a standard get request parameters for a fetch request
 * @returns {object} params - Basic params for a get request using fetch
 */
export const getRequestParams = () => {
    const params = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
        data: undefined
    }
    return params;
}

/**
 * @function postRequestParams
 * Generates a standard post request parameters for a fetch request
 * @params {object} body - JSON object to be passed onto the fetch API
 * @returns {object} params - Basic params for a post request using fetch
 */
export const postRequestParams = (body) => {
    const params = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
        data: body
    }
    return params;
}

// --------------------------------

// *******************************************
// Module Exports
// -------------------------------------------
const respack = {
    STATUS: {
        OKAY,
        FAILED,
        ERROR
    },
    TYPE: {
        GET: "GET",
        POST: "POST"
    },
    GET: GET,
    POST: POST,
    ASYN: safeAsync,
    OKAY: sendOkay,
    ERROR: sendError,
    FAILED: sendFailed
};
export default respack;
// --------------------------------
