import type { ApiErrorMock } from "@/tests/types/api-error-mock";

/*
  The ways an API call can fail, as our screens see them.

  Use these instead of hand-writing an error object in a test. A screen reads the server's message
  out of the error to show it to the user, and what it shows depends on how much of that error is
  actually there — so each failure below is a different path through the code.

  One case is deliberately missing: an error with nothing in it at all. The network library always
  hands us a real error, so a test for that would be testing something that cannot happen.
*/

/** The request never reached the server: no connection, DNS failure, or it timed out. */
export const networkError = (): Error => new Error("Network Error");

/** The server rejected the request but sent an empty body, so there is no message to show. */
export const nullBodyError = (): ApiErrorMock => ({ response: { data: null } });

/** An ordinary failure from the server. Pass a `messageCode` when the screen reacts to that code. */
export const serverError = (message?: string, messageCode?: string): ApiErrorMock => ({
	response: {
		data: {
			...(message !== undefined && { message }),
			...(messageCode !== undefined && { messageCode }),
		},
	},
});
