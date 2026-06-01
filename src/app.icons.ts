import {registerIcon} from "@/cards/icons";

import {ChevronDown, User, Save, FileUp} from "lucide-react";

export const ICONS = {
  down: registerIcon("down", ChevronDown),
  user: registerIcon("user", User),
  save: registerIcon("save", Save),
  load: registerIcon("load", FileUp),
} as const;
