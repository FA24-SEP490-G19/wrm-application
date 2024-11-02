package com.wrm.application.service;

import com.wrm.application.dto.UserDTO;
import com.wrm.application.model.User;
import com.wrm.application.response.user.UserResponse;

public interface IUserService {
    UserResponse createUser(UserDTO userDTO) throws Exception;

    String login(String email, String password) throws Exception;
}
