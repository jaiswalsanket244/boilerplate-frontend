import type { Mock } from "vitest";

/*
  Reads the react-query callbacks a component passed as the second `mutate` argument.
*/
export const mutationCallbacks = <P, C>(mutate: Mock<(payload: P, callbacks: C) => void>, label = "mutation"): C => {
	const callbacks = mutate.mock.calls[0]?.[1];
	if (!callbacks) throw new Error(`Expected the ${label} to have been called`);
	return callbacks;
};
