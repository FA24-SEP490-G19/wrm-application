import {useEffect, useState} from "react";
import axios from "axios";

const Demo = () => {

    const [info, setInfo] = useState([]);

    useEffect(() => {
        axios.get(`https://jsonplaceholder.typicode.com/todos/1`).then(response => setInfo(response.data));

    }, []);


    return (
        <div>
            <p>{info.userId}</p>
            <p>{info.title}</p>
        </div>
    )

}
export default Demo;