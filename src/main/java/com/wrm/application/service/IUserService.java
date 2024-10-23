package com.wrm.application.service;

import com.wrm.application.dto.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.model.User;

public interface IUserService {
    User createUser(UserDTO userDTO) throws Exception;

    String login(String email, String password) throws Exception;

    void changePassword(Long userId, ChangePasswordDTO changePasswordDTO) throws Exception;

}
