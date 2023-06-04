import React from "react";
import Card from "./Card";
const GridView = ({ tasks, filter1, filter2, filter3, filter4,filter5 }) => {

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };
  const formatMonthYear = (date) => {
    return date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  };
  return (
    <div className="WIPCards">
      {tasks
        ?.filter((info) => {
          const filter1Result =
            filter1.value !== "Any"
              ? filter1.value === "Today"
                ? formatDate(new Date()) ===
                  formatDate(new Date(info.assigned.seconds * 1000))
                : filter1.value === "Month"
                ? formatMonthYear(new Date()) ===
                  formatMonthYear(new Date(info.assigned.seconds * 1000))
                : filter1.value === "Year"
                ? new Date().getFullYear() ===
                  new Date(info.assigned.seconds * 1000).getFullYear()
                : true
              : true;
              const filter2Result =
              filter2.value !== "Any"
                ? filter2.value === info.teammateName
                : true;
            const filter3Result =
              filter3.value !== "Any"
                ? filter3.value === info.clientName
                : true;
            const filter5Result =
              filter5.value !== "Any"
                ? filter5.value === info.status
                : true;
            const filter4Result =
              filter4.value !== "Any" ? filter4.value === info.type : true;

            return (
              filter1Result && filter2Result && filter3Result && filter4Result && filter5Result
            );
          })

        .map((info, count) => {
          return (
            <div key={count}>
              <Card index={count} task={info} />
            </div>
          );
        })}
    </div>
  );
};

export default GridView;
