/*
  What a failed API call looks like by the time one of our screens handles it.

  A screen digs the server's message out of the error to show the user. Depending on how the call
  failed, parts of that error simply are not there — these types spell out which parts, so a test
  can build a realistic failure instead of guessing at one.
*/

/** What the server sends back when it rejects a request. It may carry a message, a code, both, or neither. */
export type ApiErrorBody = {
	message?: string;
	messageCode?: string;
};

/** The server's reply. `data` is empty when it answered with no body at all. */
export type ApiErrorResponseMock = {
	data?: ApiErrorBody | null | "";
};

/** A failure from the server, trimmed to the parts our screens actually read. */
export type ApiErrorMock = {
	response?: ApiErrorResponseMock;
};

/** Anything a test can hand to an error handler: a server failure, or a plain "it never connected" error. */
export type MockedApiError = ApiErrorMock | Error;
