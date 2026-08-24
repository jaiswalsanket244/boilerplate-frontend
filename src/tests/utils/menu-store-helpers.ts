import { useMenuStore } from "@/stores/menu-store";
import type { PERMISSIONS } from "@/types/permission";

export const seedMenuPermissions = (permissions: PERMISSIONS[]) => useMenuStore.setState({ permissions });

export const resetMenuStore = () => useMenuStore.getState().resetMenu();
