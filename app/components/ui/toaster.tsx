import {
  Button,
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
} from "react-aria-components";
import { cn } from "~/utils/cn";

interface IToastContent {
  title: string;
  description?: string;
}

export const toastQueue = new ToastQueue<IToastContent>();

/**
.react-aria-ToastRegion {
  position: fixed;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  border-radius: 8px;
  outline: none;

  &[data-focus-visible] {
    outline: 2px solid slateblue;
    outline-offset: 2px;
  }
}

.react-aria-Toast {
  display: flex;
  align-items: center;
  gap: 16px;
  background: slateblue;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  outline: none;

  &[data-focus-visible] {
    outline: 2px solid slateblue;
    outline-offset: 2px;
  }

  .react-aria-ToastContent {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0px;

    [slot=title] {
      font-weight: bold;
    }
  }

  .react-aria-Button[slot=close] {
    flex: 0 0 auto;
    background: none;
    border: none;
    appearance: none;
    border-radius: 50%;
    height: 32px;
    width: 32px;
    font-size: 16px;
    border: 1px solid white;
    color: white;
    padding: 0;
    outline: none;

    &[data-focus-visible] {
      box-shadow: 0 0 0 2px slateblue, 0 0 0 4px white;
    }

    &[data-pressed] {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}
 */
export function Toaster() {
  return (
    <ToastRegion
      queue={toastQueue}
      className={cn(
        "fixed bottom-4 right-4 flex flex-col-reverse gap-2 rounded-lg",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      )}
    >
      {({ toast }) => (
        <Toast
          toast={toast}
          className={cn(
            "flex items-center gap-4 bg-blue-500 text-white px-3 py-4 rounded-lg",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          )}
        >
          <ToastContent className="flex flex-col flex-auto min-w-0">
            <Text slot="title" className="font-bold">
              {toast.content.title}
            </Text>
            <Text slot="description">{toast.content.description}</Text>
          </ToastContent>
          <Button
            slot="close"
            className="flex-[0_0_auto] rounded-full h-8 w-8 text-base text-white outline-none p-0 border border-white pressed:bg-white/20 focus-visible:shadow-blue-400"
          >
            x
          </Button>
        </Toast>
      )}
    </ToastRegion>
  );
}
