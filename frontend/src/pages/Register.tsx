import { Box, Button, Link as ChakraLink, Container, Flex, FormControl, FormLabel, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/api";
import { EMAIL_PATTERN } from "../constants/email";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors, isValid },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: createAccount, isPending, isError, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      reset();
      navigate("/", {
        replace: true,
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    createAccount(data);
  };

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Container mx="auto" maxW="md" py={12} px={6} textAlign="center">
        <Heading fontSize="4xl" mb={6}>
          Create an account
        </Heading>
        <Box rounded="lg" bg="gray.700" boxShadow="lg" p={8}>
          {isError && (
            <Box mb={3} color="red.400">
              {error?.message || "An error occurred"}
            </Box>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl id="email" isInvalid={Boolean(errors.email)}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_PATTERN,
                      message: "Invalid email format",
                    },
                  })}
                  autoFocus
                />
                {errors.email?.message && (
                  <Text fontSize="sm" color="red.500">
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>

              <FormControl id="password" isInvalid={Boolean(errors.password)}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password?.message && (
                  <Text fontSize="sm" color="red.500">
                    {errors.password.message}
                  </Text>
                )}
                <Text color="text.muted" fontSize="xs" textAlign="left" mt={2}>
                  - Must be at least 6 characters long.
                </Text>
              </FormControl>

              <FormControl id="confirmPassword" isInvalid={Boolean(errors.confirmPassword)}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) => value === watch("password") || "Passwords do not match", // Corrected line
                  })}
                />
                {errors.confirmPassword?.message && (
                  <Text fontSize="sm" color="red.500">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </FormControl>

              <Button
                my={2}
                isLoading={isPending || isSubmitting}
                isDisabled={!isValid}
                type="submit"
              >
                Create Account
              </Button>

              <Text align="center" fontSize="sm" color="text.muted">
                Already have an account?{" "}
                <ChakraLink as={Link} to="/login">
                  Sign in
                </ChakraLink>
              </Text>
            </Stack>
          </form>
        </Box>
      </Container>
    </Flex>
  );
};

export default Register;
