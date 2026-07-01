function StatusBadge({
    children,
    color="gray"
}){

    return(

        <span className={`status ${color}`}>

            {children}

        </span>

    )

}

export default StatusBadge