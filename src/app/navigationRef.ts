import {
  CommonActions,
  createNavigationContainerRef,
} from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<any>();

export function resetTo(routeName: string) {
  if (!navigationRef.isReady()) return;

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName }],
    })
  );
}

export function resetToMainTabs(tabName: string = "Dashboard") {
  if (!navigationRef.isReady()) return;

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: "MainTabs",
          state: {
            index: 0,
            routes: [{ name: tabName }],
          },
        },
      ],
    })
  );
}

export function navigate(routeName: string, params?: object) {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate(routeName as never, params as never);
}