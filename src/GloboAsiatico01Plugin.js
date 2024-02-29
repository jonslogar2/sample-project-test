import React from "react";
import { FlexPlugin } from "@twilio/flex-plugin";

import CustomTaskList from "./components/CustomTaskList/CustomTaskList";

import globoLogo from "./assets/globo-asiatico-logo.jpg";
import cynLogo from "./assets/cyn-logo.jpeg";

const PLUGIN_NAME = "GloboAsiatico01Plugin";

export default class GloboAsiatico01Plugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   */
  async init(flex, manager) {
    // CRM
    flex.CRMContainer.defaultProps.uriCallback = (task) => {
      console.log(task);
      if (task && task.attributes.crmid) {
        const url = `https://app.hubspot.com/contacts/45396811/record/0-1/${task.attributes.crmid}`;
        console.log(`URL`, url);
        return url;
      } else
        return "https://app.hubspot.com/contacts/45396811/objects/0-1/views/all/list";
    };

    const options = { sortOrder: -1 };
    // * Main Header
    flex.MainHeader.Content.add(
      <div
        key="custom-header"
        style={{
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "10px",
          marginRight: "-27px",
        }}
      >
        <img
          src={globoLogo}
          alt="Globo Asiatico"
          style={{ height: "30px", marginRight: "5px" }}
        />
        <p>Globo Asiatico Powered by</p>

        <img
          src={cynLogo}
          alt="CYN Solutions Inc."
          style={{ height: "30px", marginRight: "5px", marginLeft: "5px" }}
        />
        <p>CYN Solutions Inc. </p>
        <p style={{ fontSize: "19px", marginLeft: "8px" }}>X</p>
      </div>,
      { sortOrder: 1 }
    );

    // * No Task String
    manager.strings.NoTasks = "No task right now, go make some coffee. :)";

    // * Panel 1
    flex.AgentDesktopView.Panel1.Content.add(
      <CustomTaskList key="GloboAsiatico01Plugin-component" />,
      options
    );

    // ? Inbound Call Phone number format
    flex.Actions.replaceAction("StartOutboundCall", (payload, original) => {
      // Default all outbound calls to external SIP interface
      /*
       * Instructions:
       * Replace "sipInterfaceIPAddress" with external SIP Interface
       */

      const sipInterfaceIPAddress = "98.158.148.76";
      const technicalprefix = "3953";
      const termination = ";edge=tokyo";

      console.log(`Before payload Destigation: ${payload.destination}`);

      payload.destination =
        "sip:" +
        technicalprefix +
        payload.destination +
        `@${sipInterfaceIPAddress}` +
        termination;
      payload.callerId = "+639190599575";
      console.log("updated outbound call to:", payload);
      original(payload);
    });

    let alertSound = new Audio("https://demo.twilio.com/docs/classic.mp3");
    alertSound.loop = true;

    const resStatus = [
      "accepted",
      "canceled",
      "rejected",
      "rescinded",
      "timeout",
    ];

    manager.workerClient.on("reservationCreated", function (reservation) {
      if (
        reservation.task.taskChannelUniqueName === "voice" &&
        reservation.task.attributes.direction === "inbound"
      ) {
        alertSound.play();
      }
      resStatus.forEach((e) => {
        reservation.on(e, () => {
          alertSound.pause();
        });
      });
    });
  }
}
