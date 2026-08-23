function Statistics({
    totalTasks,
    completedTasks,
    pendingTasks
}) {
    return (
        <section className="statistics">

            <div className="stat-card">

                <span>
                    Total Tasks
                </span>

                <strong>
                    {totalTasks}
                </strong>

            </div>

            <div className="stat-card">

                <span>
                    Completed
                </span>

                <strong>
                    {completedTasks}
                </strong>

            </div>

            <div className="stat-card">

                <span>
                    Pending
                </span>

                <strong>
                    {pendingTasks}
                </strong>

            </div>

        </section>
    );
}

export default Statistics;