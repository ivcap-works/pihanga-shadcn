import {Input} from "@/registry/ui/input";
import type {PiCardProps} from "@pihanga2/core";
import type {
  NavbarSearchEvents,
  NavbarSearchProps,
} from "./navbarSearch.type";

export const Component = (
  props: PiCardProps<NavbarSearchProps, NavbarSearchEvents>,
): React.ReactNode => {
  const {
    searchItems,
    placeholder = "Load Spec...",
    onSearchSubmit,
    onSearchItems,
    onSearchFocus,
    cardName,
  } = props;
  const listId = searchItems?.length ? `${cardName}-search` : undefined;

  const submitSearch = (value: string, input?: HTMLInputElement | null) => {
    const search = value.trim();
    if (!search) return;
    onSearchSubmit?.({search});
    if (input) {
      input.value = "";
      emitSearchInput("");
    }
    input?.blur();
  };

  const emitSearchInput = (value: string) => {
    onSearchItems?.({search: value});
  };

  const maybeSubmit = (value: string, input?: HTMLInputElement | null) => {
    if (searchItems?.includes(value)) {
      submitSearch(value, input);
    }
  };

  const openNativeSuggestions = (input: HTMLInputElement | null) => {
    if (!input) {
      return;
    }

    const pickerInput = input as HTMLInputElement & {
      showPicker?: () => void;
    };
    pickerInput.showPicker?.();
  };

  const blockManualTyping = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = new Set([
      "Tab",
      "Enter",
      "Escape",
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Shift",
      "Control",
      "Alt",
      "Meta",
    ]);

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (allowedKeys.has(event.key)) {
      if (event.key === "ArrowDown") {
        openNativeSuggestions(event.currentTarget);
      }
      return;
    }

    event.preventDefault();
  };

  return (
    <form
      onSubmit={(el) => {
        el.preventDefault();
        const data = new FormData(el.currentTarget);
        submitSearch(
          String(data.get("search") || ""),
          el.currentTarget.elements.namedItem("search") as HTMLInputElement | null,
        );
      }}
      autoComplete="off"
      className="ml-auto flex-1 sm:flex-initial"
      data-pihanga={cardName}
    >
      <div className="relative">
        <Input
          type="search"
          placeholder={placeholder}
          name="search"
          list={listId}
          autoComplete="off"
          className="sm:w-[300px] md:w-[200px] lg:w-[300px]"
          onFocus={() => {
            onSearchFocus?.({});
          }}
          onClick={(e) => {
            openNativeSuggestions(e.currentTarget);
          }}
          onBeforeInput={(e) => {
            e.preventDefault();
          }}
          onKeyDown={blockManualTyping}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            const value = input.value;
            emitSearchInput(value);
            maybeSubmit(value, input);
          }}
          onChange={(e) => {
            const input = e.target as HTMLInputElement;
            const value = input.value;
            emitSearchInput(value);
            maybeSubmit(value, input);
          }}
          onBlur={(e) => {
            const input = e.target as HTMLInputElement;
            const value = input.value;
            maybeSubmit(value, input);
          }}
        />
        {listId && (
          <datalist id={listId}>
            {searchItems!.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        )}
      </div>
    </form>
  );
};
