var _a;
import { TablerIcon } from "@bokehjs/models/ui/icons/tabler_icon";
import { Control, ControlView } from '@bokehjs/models/widgets/control';
import { build_view } from '@bokehjs/core/build_views';
export class ToggleIconView extends ControlView {
    *controls() { }
    remove() {
        this.icon_view?.remove();
        super.remove();
    }
    async lazy_initialize() {
        await super.lazy_initialize();
        const size = this.calculate_size();
        const icon_model = new TablerIcon({ icon_name: this.model.icon, size: size });
        this.icon_view = await build_view(icon_model, { parent: this });
        this.icon_view.el.addEventListener('click', () => this.toggle_value());
    }
    *children() {
        yield* super.children();
        yield this.icon_view;
    }
    toggle_value() {
        if (this.model.disabled) {
            return;
        }
        this.model.value = !this.model.value;
        this.update_icon();
    }
    connect_signals() {
        super.connect_signals();
        const { icon, active_icon, value, disabled } = this.model.properties;
        this.on_change([active_icon, icon, value], () => this.update_icon());
        this.on_change(disabled, () => this.update_cursor());
    }
    render() {
        super.render();
        this.icon_view.render();
        this.update_icon();
        this.update_cursor();
        this.shadow_el.appendChild(this.icon_view.el);
    }
    update_cursor() {
        this.icon_view.el.style.cursor = this.model.disabled ? 'not-allowed' : 'pointer';
    }
    update_icon() {
        const icon = this.model.value ? this.get_active_icon() : this.model.icon;
        this.icon_view.model.icon_name = icon;
        this.icon_view.el.style.lineHeight = '0';
    }
    get_active_icon() {
        return this.model.active_icon !== '' ? this.model.active_icon : `${this.model.icon}-filled`;
    }
    calculate_size() {
        if (this.model.size !== null)
            return this.model.size;
        const maxWidth = this.model.width ?? 15;
        const maxHeight = this.model.height ?? 15;
        const size = Math.max(maxWidth, maxHeight);
        return `${size}px`;
    }
}
ToggleIconView.__name__ = "ToggleIconView";
export class ToggleIcon extends Control {
    constructor(attrs) {
        super(attrs);
    }
}
_a = ToggleIcon;
ToggleIcon.__name__ = "ToggleIcon";
ToggleIcon.__module__ = "panel.models.icon";
(() => {
    _a.prototype.default_view = ToggleIconView;
    _a.define(({ Boolean, Nullable, String }) => ({
        active_icon: [String, ""],
        icon: [String, "heart"],
        size: [Nullable(String), null],
        value: [Boolean, false],
    }));
})();
//# sourceMappingURL=icon.js.map