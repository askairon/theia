/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { inject, injectable } from 'inversify';
import { Command, CommandRegistry } from '../../common/command';
import { Widget } from '../widgets';

export const TabBarToolbarContribution = Symbol('TabBarToolbarContribution');
export interface TabBarToolbarContribution {

    registerToolbarItems(registry: TabBarToolbarRegistry): void;

}

export interface TabBarToolbarItem {

    /**
     * The unique ID of the toolbar item.
     */
    readonly id: string;

    /**
     * The command to execute.
     */
    readonly command: Command;

    /**
     * Function that evaluates to `true` if the toolbar item is active for the given widget. Otherwise, `false`.
     */
    readonly isActive: (widget: Widget) => boolean;

    /**
     * Priority among the items. Can be negative. The smaller the number the left-most the item will be placed in the toolbar. It is `0` by default.
     */
    readonly priority?: number;

    /**
     * Optional tooltip for the item. If not specified, falls back to `Command.label` (if defined).
     */
    readonly tooltip?: string;

    /**
     * Optional icon class for the item. If not specified, falls back to `Command.iconClass` (if defined). If the `iconClass` is not given at all,
     * the it uses the `label` of the command.
     */
    readonly iconClass?: string;

}

@injectable()
export class TabBarToolbarRegistry {

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    protected items: Map<string, TabBarToolbarItem> = new Map();

    /**
     * Registers the given item. Throws an error, if the corresponding command cannot be found or an item has been already registered for the desired command.
     *
     * @param item the item to register.
     */
    registerItem(item: TabBarToolbarItem): void {
        const { id } = item;
        if (this.items.has(id)) {
            throw new Error(`A toolbar item is already registered with the '${id}' ID.`);
        }
        this.items.set(id, item);
    }

    activeItemsFor(widget: Widget): TabBarToolbarItem[] {
        return Array.from(this.items.values())
            .filter(item => this.commandRegistry.isEnabled(item.id))
            .filter(item => item.isActive(widget));
    }

}
