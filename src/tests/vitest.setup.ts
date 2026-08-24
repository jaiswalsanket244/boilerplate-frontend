import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

import "@testing-library/jest-dom";

import * as matchers from "@testing-library/jest-dom/matchers";

import "@/tests/utils/mock-next-navigation";
import "@/tests/utils/mock-react-query";
import "@/tests/utils/mock-lucide-react";
import "@/tests/utils/mock-cookies-next";
import "@/tests/utils/mock-api-client";
import "@/tests/utils/mock-use-recently-changed-rows";
import "@/tests/utils/mock-global-classes";
import "@/tests/utils/mock-cookies-utils";
import "@/tests/utils/mock-onesignal";
// Component Mocks
import "@/tests/component-mocks/mocks";
import "@/tests/component-mocks/dialog-mock";
import "@/tests/component-mocks/alert-dialog-mock";

expect.extend(matchers);

afterEach(() => {
	cleanup();
});
