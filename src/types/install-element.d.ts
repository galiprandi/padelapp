// Type declarations for the experimental <install> element (HTMLInstallElement).
// Origin trial: Chrome/Edge 148–153.
// Spec: https://github.com/WICG/install-element

interface InstallElementEventMap {
  promptaction: Event;
  promptdismiss: Event;
  validationstatuschanged: Event;
}

declare global {
  interface HTMLInstallElement extends HTMLElement {
    installurl?: string;
    manifestid?: string;
    invalidReason?: string;
    addEventListener<K extends keyof InstallElementEventMap>(
      type: K,
      listener: (this: HTMLInstallElement, ev: InstallElementEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof InstallElementEventMap>(
      type: K,
      listener: (this: HTMLInstallElement, ev: InstallElementEventMap[K]) => void,
      options?: boolean | EventListenerOptions,
    ): void;
  }

  var HTMLInstallElement: {
    prototype: HTMLInstallElement;
    new (): HTMLInstallElement;
  };

  interface HTMLElementTagNameMap {
    install: HTMLInstallElement;
  }

  interface Window {
    HTMLInstallElement?: typeof HTMLInstallElement;
  }
}

import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      install: DetailedHTMLProps<
        HTMLAttributes<HTMLInstallElement> & {
          installurl?: string;
          manifestid?: string;
        },
        HTMLInstallElement
      >;
    }
  }
}

export {};
