package com.wrm.application.service;

import com.wrm.application.dto.UserDTO;
import com.wrm.application.model.User;

public interface IUserService {
    User createUser(UserDTO userDTO);

    String login(String email, String password) throws Exception;
}
