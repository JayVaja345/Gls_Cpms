import React from "react";
import { FaCheckSquare, FaUsers } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { GrUserManager, GrUserWorker } from "react-icons/gr";
import { FaListUl } from "react-icons/fa";
import { RiArrowDownSFill, RiArrowUpSFill, RiPlayListAddLine } from "react-icons/ri";
import { PiStudentDuotone } from "react-icons/pi";
import { FaClipboardCheck, FaIndustry, FaEnvelopeOpenText } from "react-icons/fa";
import { LiaIndustrySolid } from "react-icons/lia";
import { FaUserSecret } from "react-icons/fa";

export const SidebarData = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: <AiFillHome />
  },
  {
    title: "Management",
    icon: <FaUserSecret />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    subNav: [
      {
        title: "List All",
        path: "/admin/management",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "Add New",
        path: "/admin/add-management-admin",
        icon: <RiPlayListAddLine />,
        cName: "sub-nav",
      },
    ],
  },
  {
    title: "TPO",
    icon: <GrUserWorker />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    subNav: [
      {
        title: "List All",
        path: "/admin/tpo",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "Add New",
        path: "/admin/add-tpo-admin",
        icon: <RiPlayListAddLine />,
        cName: "sub-nav",
      },
    ],
  },
  {
    title: "Students",
    icon: <PiStudentDuotone />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    subNav: [
      {
        title: "List",
        path: "/admin/student",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "Approve",
        path: "/admin/approve-student",
        icon: <FaClipboardCheck />,
        cName: "sub-nav",
      },
      {
        title: "Add New",
        path: "/admin/add-student",
        icon: <RiPlayListAddLine />,
        cName: "sub-nav",
      },
    ],
  },
  {
    title: "Company",
    icon: <LiaIndustrySolid />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    subNav: [
      {
        title: "List All",
        path: "/admin/companys",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "Add New",
        path: "/admin/add-company",
        icon: <RiPlayListAddLine />,
      },
    ],
  },
  {
    title: "Job Listings",
    icon: <FaIndustry />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,

    subNav: [
      {
        title: "List All",
        path: "/admin/job-listings",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "Add New",
        path: "/admin/post-job",
        icon: <RiPlayListAddLine />,
      },
    ],
  },
  {
    title: "Role Customization",
    icon: <FaIndustry />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,

    subNav: [
      {
        title: "Manage Roles",
        path: "/admin/manage-roles",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
      {
        title: "List All User Roles",
        path: "/admin/role-customization",
        icon: <FaListUl />,
        cName: "sub-nav",
      },
    ],
    
  },
  {
    title: "Placement Report",
    path: "/admin/placement-report",
    icon: <FaClipboardCheck />,
  }
];
