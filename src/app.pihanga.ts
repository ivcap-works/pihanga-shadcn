import {registerCard, registerFramework} from "@pihanga2/core";
import {SdFramework} from "./cards/framework";
import {PageWithNavbar} from "./cards/pageWithNavbar";
import {List} from "./cards/list";
import {FlexGrid} from "./cards/flexGrid";
import {Form} from "./cards/form";
import {Stack} from "./cards/stack";
import {Field} from "./cards/field";
import {Select} from "./cards/select";

export const AppCard = {
  Main: "app/main",

  List: "app/list",
  Content: "app/content",

  NavbarSearch: "app/navbar/search",
  LeftNav: "app/main/leftNav",
  RightNav: "app/main/rightNav",
  UserMenu: "app/main/userMenu",
  UserAvatar: "app/main/userAvatar",
};

export function appPiInit(): void {
  registerFramework(
    SdFramework({
      page: AppCard.Main,
      theme: "light",
    }),
  );

  registerCard(
    AppCard.Main,
    PageWithNavbar({
      title: "Pihanga Demo",
      main: FlexGrid({
        cards: {
          list: AppCard.List,
          content: AppCard.Content,
        },
        template: {
          area: [["list", "content"]],
          columns: ["1fr", "4fr"],
          gap: "16px",
        },
      }),
    }),
  );

  registerCard(
    AppCard.List,
    List({
      items: [
        {id: "1", title: "First item"},
        {id: "2", title: "Second item"},
        {id: "3", title: "Third item"},
      ],
    }),
  );

  const colorOptions = ["red", "green", "blue"].map((v) => ({
    value: v,
    label: v,
  }));

  const form = Form({
    content: [
      Stack({
        content: [
          Field({
            label: "Favorite color",
            fieldCard: Select({
              name: "favoriteColor",
              options: colorOptions,
              selfManaged: true,
            }),
          }),
        ],
      }),
    ],
  });

  registerCard(AppCard.Content, form);
}
