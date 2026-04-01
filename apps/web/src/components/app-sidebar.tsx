import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

import { data } from "@/lib/sidebar"
import { DropdownMenuTrigger } from "./ui/dropdown-menu"
import { TeamSwitcher } from "./TeamSwitcher"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // return (
    //     <Sidebar {...props}>
    //         <SidebarHeader>
    //             <label >Dashbaord</label>
    //             <hr />
    //         </SidebarHeader>
    //         <SidebarContent>
    //             {/* We create a SidebarGroup for each parent. */}
    //             {data.navMain.map((item) => (
    //                 <SidebarGroup key={item.title}>
    //                     <SidebarGroupLabel>
    //                         <a href={item.url} className="font-semibold hover:text-primary">
    //                             {item.title}
    //                         </a>
    //                     </SidebarGroupLabel>
    //                     <SidebarGroupContent>
    //                         <SidebarMenu>
    //                             {item.items.map((item) => (
    //                                 <SidebarMenuItem key={item.title}>
    //                                     <SidebarMenuButton asChild>
    //                                         <a href={item.url}>{item.title}</a>
    //                                     </SidebarMenuButton>
    //                                 </SidebarMenuItem>
    //                             ))}
    //                         </SidebarMenu>

    //                     </SidebarGroupContent>
    //                 </SidebarGroup>
    //             ))}
    //         </SidebarContent>

    //         <SidebarRail />
    //     </Sidebar>
    // )
    return (
        <Sidebar collapsible="icon" {...props}>
            {/* <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader> */}
            <SidebarContent>
                <NavMain items={data.navMain} />
                {/* <NavProjects projects={data.projects} /> */}
            </SidebarContent>
            <SidebarFooter>
                {/* <NavUser user={data.user} /> */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )

}
