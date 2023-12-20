import { TablerIconView } from "@bokehjs/models/ui/icons/tabler_icon";
import { Control, ControlView } from '@bokehjs/models/widgets/control';
import type { IterViews } from '@bokehjs/core/build_views';
import * as p from "@bokehjs/core/properties";
export declare class ToggleIconView extends ControlView {
    model: ToggleIcon;
    icon_view: TablerIconView;
    controls(): Generator<never, void, unknown>;
    remove(): void;
    lazy_initialize(): Promise<void>;
    children(): IterViews;
    toggle_value(): void;
    connect_signals(): void;
    render(): void;
    update_cursor(): void;
    update_icon(): void;
    get_active_icon(): string;
    calculate_size(): string;
}
export declare namespace ToggleIcon {
    type Attrs = p.AttrsOf<Props>;
    type Props = Control.Props & {
        active_icon: p.Property<string>;
        icon: p.Property<string>;
        size: p.Property<string | null>;
        value: p.Property<boolean>;
    };
}
export interface ToggleIcon extends ToggleIcon.Attrs {
}
export declare class ToggleIcon extends Control {
    properties: ToggleIcon.Props;
    __view_type__: ToggleIconView;
    static __module__: string;
    constructor(attrs?: Partial<ToggleIcon.Attrs>);
}
