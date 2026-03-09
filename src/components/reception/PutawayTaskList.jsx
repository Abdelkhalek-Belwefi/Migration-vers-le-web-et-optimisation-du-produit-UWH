import React from "react";
import "./styles/PutawayTaskList.css";

import { 
    FaClipboardList,
    FaBox,
    FaBarcode,
    FaHashtag,
    FaArrowRight,
    FaCalendarAlt
} from "react-icons/fa";

const PutawayTaskList = ({ tasks }) => {

    const getStatutClass = (statut) => {
        switch (statut) {
            case "A_FAIRE":
                return "badge-warning";
            case "EN_COURS":
                return "badge-info";
            case "TERMINEE":
                return "badge-success";
            default:
                return "";
        }
    };

    const getStatutLabel = (statut) => {
        switch (statut) {
            case "A_FAIRE":
                return "À faire";
            case "EN_COURS":
                return "En cours";
            case "TERMINEE":
                return "Terminée";
            default:
                return statut;
        }
    };

    return (
        <div className="putaway-tasks-section">

            <h3 className="title">
                <FaClipboardList className="title-icon" />
                Tâches de rangement générées
            </h3>

            <div className="table-container">
                <table className="putaway-table">
                    <thead>
                        <tr>
                            <th><FaBox /> Article</th>
                            <th><FaBarcode /> Lot</th>
                            <th><FaHashtag /> Quantité</th>
                            <th><FaArrowRight /> Source</th>
                            <th><FaArrowRight /> Destination</th>
                            <th>Statut</th>
                            <th><FaCalendarAlt /> Date création</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td>{task.articleDesignation}</td>
                                <td>{task.lot || "-"}</td>
                                <td>{task.quantite}</td>
                                <td>{task.emplacementSource}</td>
                                <td>{task.emplacementDestination}</td>

                                <td>
                                    <span className={`badge ${getStatutClass(task.statut)}`}>
                                        {getStatutLabel(task.statut)}
                                    </span>
                                </td>

                                <td>
                                    <FaCalendarAlt className="date-icon" />{" "}
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

        </div>
    );
};

export default PutawayTaskList;