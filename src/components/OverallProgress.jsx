function OverallProgress({
    completedTasks,
    totalTasks,
    progress
}) {
    return (
        <section className="overall-progress">

            <h2>
                Overall Progress
            </h2>

            <p>
                Completed: {completedTasks} / {totalTasks}
            </p>

            <div className="overall-progress-container">

                <div
                    className="overall-progress-bar"
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            <p>
                {progress.toFixed(0)}%
            </p>

        </section>
    );
}

export default OverallProgress;